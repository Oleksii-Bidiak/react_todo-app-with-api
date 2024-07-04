export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export type UpdateTodoData = Partial<Omit<Todo, 'id' | 'userId'>>;

export enum TodoStatus {
  All = 'All',
  Active = 'Active',
  Completed = 'Completed',
}

export const TodoStatusRoutes: Record<TodoStatus, string> = {
  [TodoStatus.All]: '/',
  [TodoStatus.Active]: '/active',
  [TodoStatus.Completed]: '/completed',
};
