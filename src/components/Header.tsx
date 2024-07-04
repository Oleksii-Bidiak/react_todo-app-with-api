/* eslint-disable react/display-name */
import classNames from 'classnames';
import { ChangeEvent, RefObject, memo } from 'react';

interface Props {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  isLoading: boolean;
  addTodo: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  todosCount: number;
  completedTodosCount: number;
  toggleAll: () => void;
}

export const Header = memo((props: Props) => {
  const {
    addTodo,
    inputRef,
    onChange,
    value,
    isLoading,
    todosCount,
    completedTodosCount,
    toggleAll,
  } = props;

  return (
    <header className="todoapp__header">
      {todosCount !== 0 && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: todosCount === completedTodosCount,
          })}
          data-cy="ToggleAllButton"
          onClick={toggleAll}
        />
      )}

      <form onSubmit={addTodo}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          value={value}
          onChange={onChange}
          disabled={isLoading}
        />
      </form>
    </header>
  );
});
