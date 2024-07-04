import { ChangeEvent, FC, FormEvent, RefObject } from 'react';

interface Props {
  value: string;
  inputRef?: RefObject<HTMLInputElement>;
  isLoading?: boolean;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  classNames?: string;
}

export const Form: FC<Props> = props => {
  const {
    onSubmit,
    inputRef = null,
    isLoading = false,
    onChange,
    value,
    onBlur = () => {},
    classNames,
  } = props;

  return (
    <form onSubmit={onSubmit} onBlur={onBlur}>
      <input
        data-cy="NewTodoField"
        type="text"
        className={classNames}
        // className="todoapp__new-todo"
        placeholder="What needs to be done?"
        ref={inputRef}
        value={value}
        onChange={onChange}
        disabled={isLoading}
        autoFocus
      />
    </form>
  );
};
