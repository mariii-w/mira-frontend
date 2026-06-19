import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  createException,
  deleteException,
  getGetCalendarQueryKey,
  getGetWeeklyScheduleQueryKey,
  getListExceptionsQueryKey,
  getCalendar,
  getWeeklySchedule,
  listExceptions,
  replaceWeeklySchedule,
  updateException,
} from "../api/mira";
import type {
  CreateScheduleExceptionRequest,
  ReplaceWeeklyScheduleRequest,
  UpdateScheduleExceptionRequest,
} from "../api/model";
import { CalendarPage } from "../components/CalendarPage";
import { get_access_token, useAuthStore } from "../stores/auth";

export const Route = createFileRoute("/calendar")({
  component: CalendarRoute,
});

function toLocalDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

async function getAuthHeaders(): Promise<HeadersInit | undefined> {
  const token = await get_access_token();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function isSuccessStatus(status: number) {
  return status >= 200 && status < 300;
}

// eslint-disable-next-line react-refresh/only-export-components
function CalendarRoute() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId;
  const queryUserId = userId ?? "";
  const isProvider = user?.userType === "PROVIDER";

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const from = toLocalDate(new Date(year, month - 1, 1));
  const to = toLocalDate(new Date(year, month, 0));

  const upcomingTo = new Date(today);
  upcomingTo.setDate(upcomingTo.getDate() + 30);
  const upcomingFrom = toLocalDate(today);
  const upcomingToStr = toLocalDate(upcomingTo);

  const { data: monthResponse } = useQuery({
    queryKey: getGetCalendarQueryKey(queryUserId, { from, to }),
    queryFn: async ({ signal }) =>
      getCalendar(
        queryUserId,
        { from, to },
        { signal, headers: await getAuthHeaders() },
      ),
    enabled: !!userId,
  });

  const { data: upcomingResponse } = useQuery({
    queryKey: getGetCalendarQueryKey(queryUserId, {
      from: upcomingFrom,
      to: upcomingToStr,
    }),
    queryFn: async ({ signal }) =>
      getCalendar(
        queryUserId,
        { from: upcomingFrom, to: upcomingToStr },
        { signal, headers: await getAuthHeaders() },
      ),
    enabled: !!userId,
  });

  const { data: exceptionsResponse } = useQuery({
    queryKey: getListExceptionsQueryKey(queryUserId),
    queryFn: async ({ signal }) =>
      listExceptions(queryUserId, {
        signal,
        headers: await getAuthHeaders(),
      }),
    enabled: !!userId && isProvider,
  });

  const { data: scheduleResponse, isLoading: scheduleLoading } = useQuery({
    queryKey: getGetWeeklyScheduleQueryKey(queryUserId),
    queryFn: async ({ signal }) =>
      getWeeklySchedule(queryUserId, {
        signal,
        headers: await getAuthHeaders(),
      }),
    enabled: !!userId && isProvider,
  });

  const saveSchedule = useMutation({
    mutationFn: async (
      schedule: Pick<ReplaceWeeklyScheduleRequest, "entries">,
    ) =>
      replaceWeeklySchedule(
        queryUserId,
        { entries: schedule.entries },
        { headers: await getAuthHeaders() },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGetWeeklyScheduleQueryKey(queryUserId),
      });
    },
  });

  const createExceptionMutation = useMutation({
    mutationFn: async (exception: CreateScheduleExceptionRequest) =>
      createException(queryUserId, exception, {
        headers: await getAuthHeaders(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListExceptionsQueryKey(queryUserId),
      });
    },
  });

  const updateExceptionMutation = useMutation({
    mutationFn: async ({
      exceptionId,
      exception,
    }: {
      exceptionId: string;
      exception: UpdateScheduleExceptionRequest;
    }) =>
      updateException(queryUserId, exceptionId, exception, {
        headers: await getAuthHeaders(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListExceptionsQueryKey(queryUserId),
      });
    },
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: async (exceptionId: string) =>
      deleteException(queryUserId, exceptionId, {
        headers: await getAuthHeaders(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getListExceptionsQueryKey(queryUserId),
      });
    },
  });

  const scheduleData =
    scheduleResponse?.status === 200 ? scheduleResponse.data : undefined;
  const exceptionsData =
    exceptionsResponse?.status === 200 ? exceptionsResponse.data : undefined;
  const monthData =
    monthResponse?.status === 200 ? monthResponse.data : undefined;
  const upcomingData =
    upcomingResponse?.status === 200 ? upcomingResponse.data : undefined;
  const upcomingBookings = (upcomingData?.items ?? [])
    .filter((booking) => new Date(booking.bookedStart) > today)
    .sort(
      (a, b) =>
        new Date(a.bookedStart).getTime() - new Date(b.bookedStart).getTime(),
    );

  function handleMonthChange(nextYear: number, nextMonth: number) {
    setYear(nextYear);
    setMonth(nextMonth);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDate(today);
  }

  return (
    <CalendarPage
      userId={userId}
      isProvider={isProvider}
      today={today}
      year={year}
      month={month}
      selectedDate={selectedDate}
      monthBookings={monthData?.items ?? []}
      upcomingBookings={upcomingBookings}
      scheduleEntries={scheduleData?.entries ?? []}
      scheduleLoaded={scheduleData != null}
      scheduleLoading={scheduleLoading}
      exceptions={exceptionsData?.items ?? []}
      scheduleSaving={saveSchedule.isPending}
      scheduleError={
        isSuccessStatus(saveSchedule.data?.status ?? 200)
          ? saveSchedule.error
          : saveSchedule.data?.data
      }
      exceptionCreating={createExceptionMutation.isPending}
      exceptionError={
        isSuccessStatus(createExceptionMutation.data?.status ?? 201)
          ? createExceptionMutation.error
          : createExceptionMutation.data?.data
      }
      onMonthChange={handleMonthChange}
      onSelectedDateChange={setSelectedDate}
      onToday={goToday}
      onSaveSchedule={(schedule) => saveSchedule.mutate(schedule)}
      onCreateException={(exception) => createExceptionMutation.mutate(exception)}
      onUpdateException={(exceptionId, exception) =>
        updateExceptionMutation.mutate({ exceptionId, exception })
      }
      onDeleteException={(exceptionId) => deleteExceptionMutation.mutate(exceptionId)}
    />
  );
}
