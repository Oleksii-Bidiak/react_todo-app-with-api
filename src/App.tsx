import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UserWarning } from './components/UserWarning';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import {
  USER_ID,
  deleteTodo,
  getTodos,
  updateTodo,
  uploadTodo,
} from './api/todos';
import { emptyTodo, errorDelay } from './utils/const';
import { Errors } from './types/Error';
import { Todo, TodoStatus } from './types/Todo';

export const App: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoTitle, setTodoTitle] = useState<string>('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingsTodos, setProcessingsTodos] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus>(
    TodoStatus.All,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInputField = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const filteringTodosByActiveStatus = useMemo(
    () => todos.filter(todo => !todo.completed),
    [todos],
  );

  const filteringTodosByCompletedStatus = useMemo(
    () => todos.filter(todo => todo.completed),
    [todos],
  );

  const filteringTodosByStatus = useMemo(() => {
    switch (selectedStatus) {
      case TodoStatus.Active:
        return filteringTodosByActiveStatus;

      case TodoStatus.Completed:
        return filteringTodosByCompletedStatus;

      default:
        return todos;
    }
  }, [
    filteringTodosByActiveStatus,
    filteringTodosByCompletedStatus,
    selectedStatus,
    todos,
  ]);

  const changeTodoTitleHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setError('');
      setTodoTitle(e.target.value);
    },
    [],
  );

  const addTodo = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!todoTitle.trim().length) {
        setError(Errors.VALIDATION);

        return;
      }

      setIsLoading(true);
      setError('');

      const newTempTodo: Todo = { ...emptyTodo, title: todoTitle.trim() };

      setTempTodo(newTempTodo);
      setProcessingsTodos([newTempTodo.id]);

      try {
        const todo = await uploadTodo({
          ...emptyTodo,
          title: todoTitle.trim(),
        });

        setTodos(currentTodos => [...currentTodos, todo]);
        setTodoTitle('');
      } catch {
        setError(Errors.ADD);
      } finally {
        setIsLoading(false);
        setTempTodo(null);
        setProcessingsTodos([]);
        focusInputField();
      }
    },
    [todoTitle],
  );

  const removeTodo = useCallback((id: number) => {
    setError('');
    setProcessingsTodos(prev => [...prev, id]);

    deleteTodo(id)
      .then(() =>
        setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id)),
      )
      .catch(() => setError(Errors.DELETE))
      .finally(() => {
        setProcessingsTodos(prev => prev.filter(prevItem => prevItem !== id));
        focusInputField();
      });
  }, []);

  const removeTodos = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const deletePromises = filteringTodosByCompletedStatus.map(todo => {
      setProcessingsTodos(prev => [...prev, todo.id]);

      deleteTodo(todo.id)
        .then(() => {
          setTodos(currentTodos => currentTodos.filter(t => t.id !== todo.id));
        })
        .catch(() => {
          setError(Errors.DELETE);
        })
        .finally(() => {
          setProcessingsTodos(prev =>
            prev.filter(prevItem => prevItem !== todo.id),
          );
          focusInputField();
        });
    });

    await Promise.allSettled(deletePromises);
    setIsLoading(false);
  }, [filteringTodosByCompletedStatus]);

  const onUpdateTodo = useCallback((todoForUpdate: Todo) => {
    updateTodo(todoForUpdate)
      .then(todo =>
        setTodos(currentTodos => {
          const newTodos = [...currentTodos];
          const index = newTodos.findIndex(t => t.id === todo.id);

          newTodos.splice(index, 1, todo);

          return newTodos;
        }),
      )
      .catch(() => {
        setError(Errors.UPDATE);
      })
      .finally(() => {
        setProcessingsTodos(prev =>
          prev.filter(prevItem => prevItem !== todoForUpdate.id),
        );
        focusInputField();
      });
  }, []);

  const toggleTodoStatus = useCallback(
    (todo: Todo) => {
      setError('');
      setProcessingsTodos(prev => [...prev, todo.id]);

      const todoForUpdate: Todo = { ...todo, completed: !todo.completed };

      setProcessingsTodos(prev => [...prev, todo.id]);
      onUpdateTodo(todoForUpdate);
    },
    [onUpdateTodo],
  );

  const toggleAll = useCallback(async () => {
    setIsLoading(true);
    setError('');

    let todosForChange: Todo[] = [];

    if (filteringTodosByCompletedStatus.length !== todos.length) {
      todosForChange = [...filteringTodosByActiveStatus];
    } else if (
      filteringTodosByCompletedStatus.length === todos.length ||
      filteringTodosByActiveStatus.length === todos.length
    ) {
      todosForChange = [...todos];
    }

    const togglePromises = todosForChange.map(todo => {
      const todoForUpdate: Todo = { ...todo, completed: !todo.completed };

      setProcessingsTodos(prev => [...prev, todo.id]);
      onUpdateTodo(todoForUpdate);
    });

    await Promise.allSettled(togglePromises);
    setIsLoading(false);
  }, [
    filteringTodosByActiveStatus,
    filteringTodosByCompletedStatus.length,
    onUpdateTodo,
    todos,
  ]);

  // const onEdit = useCallback(() => {}, []);

  const selectedStatusTodosHandler = useCallback((todoStatus: TodoStatus) => {
    setSelectedStatus(todoStatus);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError('');
    }, errorDelay);

    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    focusInputField();
  }, [todoTitle, todos, selectedStatus, isLoading]);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => setError(Errors.LOAD_TODOS));
    focusInputField();
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          value={todoTitle}
          onChange={changeTodoTitleHandler}
          addTodo={addTodo}
          inputRef={inputRef}
          isLoading={isLoading}
          todosCount={todos.length}
          completedTodosCount={filteringTodosByCompletedStatus.length}
          toggleAll={() => toggleAll()}
        />

        <TodoList
          removeTodo={removeTodo}
          processingsTodos={processingsTodos}
          tempTodo={tempTodo}
          visibleTodos={filteringTodosByStatus}
          toggleTodoStatus={toggleTodoStatus}
        />

        {(todos.length !== 0 || tempTodo) && (
          <Footer
            setStatus={selectedStatusTodosHandler}
            activeTodosCount={filteringTodosByActiveStatus.length}
            completedTodosCount={filteringTodosByCompletedStatus.length}
            selectedStatus={selectedStatus}
            removeTodos={removeTodos}
          />
        )}
      </div>

      <ErrorNotification error={error} setError={() => setError('')} />
    </div>
  );
};
