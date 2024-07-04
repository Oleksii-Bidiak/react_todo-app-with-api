/* eslint-disable react/display-name */
import { memo } from 'react';
import { Todo, UpdateTodoData } from '../types/Todo';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { TodoItem } from './TodoItem';

interface Props {
  visibleTodos: Todo[];
  processingsTodos: number[];
  tempTodo: Todo | null;
  removeTodo: (id: number) => void;
  toggleTodoStatus: (id: number, data: UpdateTodoData) => void;
  onEdit: (id: number, data: UpdateTodoData) => void;
}

export const TodoList = memo((props: Props) => {
  const {
    visibleTodos,
    processingsTodos,
    removeTodo,
    tempTodo = null,
    toggleTodoStatus,
    onEdit,
  } = props;

  // const onEditHandler = ()

  return (
    <section className="todoapp__main" data-cy="TodoList">
      <TransitionGroup>
        {visibleTodos.map(todo => (
          <CSSTransition key={todo.id} timeout={300} classNames="item">
            <TodoItem
              todo={todo}
              isActive={processingsTodos.includes(todo.id)}
              removeTodo={() => removeTodo(todo.id)}
              toggleTodoStatus={() =>
                toggleTodoStatus(todo.id, { completed: !todo.completed })
              }
              onEdit={onEdit}
            />
          </CSSTransition>
        ))}
        {tempTodo && (
          <CSSTransition key={0} timeout={300} classNames="temp-item">
            <TodoItem todo={tempTodo} isActive={true} />
          </CSSTransition>
        )}
      </TransitionGroup>
    </section>
  );
});
