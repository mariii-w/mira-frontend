import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '../../components/Button'
import { AvatarIcon } from '../../components/AvatarIcon'
import { useAuthStore } from '../../stores/auth'
import { profileMediaUrl } from '../../lib/media'

export const Route = createFileRoute("/register/done")({
  component: RegisterDoneRoute,
});

function getAuthedPrivateUserProfileQueryOptions(userId: string | undefined) {
  return {
    queryKey: getGetPrivateUserProfileQueryKey(userId ?? ""),
    enabled: !!userId,
    queryFn: async ({
      signal,
    }: QueryFunctionContext): Promise<PrivateUserProfileResponse> => {
      if (!userId) throw new Error("Not logged in.");

      const response = await getPrivateUserProfile(userId, { signal });
      if (response.status !== 200) throw new Error("Failed to load profile.");

      return response.data;
    },
  };
}

// eslint-disable-next-line react-refresh/only-export-components
function RegisterDoneRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const userId = user?.userId;

  const { data } = useQuery(getAuthedPrivateUserProfileQueryOptions(userId));

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  return (
    <section className="flex flex-col items-center justify-center gap-6 py-12 text-center" aria-labelledby="register-step-heading">
      {user?.profileMedia ? (
        <img
          src={profileMediaUrl(user.profileMedia)}
          alt="Your profile photo"
          className="h-[120px] w-[120px] rounded-full object-cover border-2 border-border"
        />
      ) : (
        <AvatarIcon
          firstName={user?.firstName ?? ''}
          lastName={user?.lastName ?? ''}
          size={120}
        />
      )}

      <div className="flex flex-col gap-2 max-w-md">
        <h2 id="register-step-heading" className="font-heading text-3xl font-bold text-foreground">
          You're all set, {firstName}!
        </h2>
        <p className="text-small text-muted">
          Welcome to Mira. You can now browse services in your area.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        trailingIcon={<ArrowRight />}
        onClick={() => navigate({ to: '/' })}
      >
        Find services
      </Button>
    </section>
  )
}