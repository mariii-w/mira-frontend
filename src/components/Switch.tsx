import {
  createContext,
  forwardRef,
  useContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react'

const SwitchCtx = createContext(false)

interface RootProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange: (value: boolean) => void
}

export const Root = forwardRef<HTMLButtonElement, RootProps>(
  ({ checked, onCheckedChange, ...rest }, ref) => (
    <SwitchCtx.Provider value={checked}>
      <button
        {...rest}
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={() => onCheckedChange(!checked)}
      />
    </SwitchCtx.Provider>
  ),
)

export const Thumb = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  (props, ref) => {
    const checked = useContext(SwitchCtx)
    return <span {...props} ref={ref} data-state={checked ? 'checked' : 'unchecked'} />
  },
)