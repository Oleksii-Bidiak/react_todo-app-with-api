/* eslint-disable react/display-name */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { FormEvent, KeyboardEvent, memo, useCallback, useState } from 'react';
import { Todo, UpdateTodoData } from '../types/Todo';
import classNames from 'classnames';
import { Form } from './Form';
import { ErrorsTypes } from '../types/Error';

interface Props<T> {
  todo: T;
  isActive: boolean;
  removeTodo?: () => void;
  toggleTodoStatus?: () => void;
  onEdit?: (id: number, data: UpdateTodoData) => void;
  cancel?: boolean;
  error?: ErrorsTypes | '';
}

export const TodoItem = memo((props: Props<Todo>) => {
  const {
    todo,
    isActive,
    removeTodo,
    toggleTodoStatus = () => {},
    onEdit,
    cancel = false,
  } = props;
  const [formActive, setFormActive] = useState<boolean>(cancel);
  const [todoTitle, setTodoTitle] = useState<string>(todo.title);

  const onEditHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (todoTitle !== todo.title) {
      onEdit?.(todo.id, { title: todoTitle.trim() });
      setFormActive(false);
    } else {
      setTodoTitle(todo.title);
    }
  };

  const blurHandler = () => {
    setFormActive(false);

    if (todoTitle !== todo.title) {
      onEdit?.(todo.id, { title: todoTitle.trim() });
    } else {
      setTodoTitle(todo.title);
    }
  };

  const keyUpHandler = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setFormActive(false);
        setTodoTitle(todo.title);
      }
    },
    [todo.title],
  );

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: todo.completed,
        'temp-item-enter temp-item-enter-active': todo.id === 0,
      })}
      key={todo.id}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={toggleTodoStatus}
        />
      </label>

      {formActive && (
        <Form
          onSubmit={onEditHandler}
          value={todoTitle}
          onChange={e => setTodoTitle(e.target.value)}
          onBlur={blurHandler}
          classNames="todo__title-field"
          onCancel={e => keyUpHandler(e)}
          dataCy="TodoTitleField"
        />
      )}
      {!formActive && (
        <>
          <span
            onDoubleClick={() => setFormActive(true)}
            data-cy="TodoTitle"
            className="todo__title"
          >
            {todo.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={removeTodo}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': isActive,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        {isActive && <div className="loader" />}
      </div>
    </div>
  );
});
