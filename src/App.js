import { withAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth'; // Новий імпорт для отримання атрибутів
import { useState, useEffect } from 'react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

const client = generateClient();

function App({ signOut, user }) {
  const [todos, setTodos] = useState([]);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    // 1. Дістаємо нікнейм користувача з Cognito
    const getUserNickname = async () => {
      try {
        const attributes = await fetchUserAttributes();
        // Якщо нікнейм є — ставимо його, якщо ні — залишаємо шматок пошти як запасний варіант
        setNickname(attributes.nickname || user?.signInDetails?.loginId?.split('@')[0]);
      } catch (error) {
        console.error('Помилка завантаження атрибутів', error);
      }
    };
    getUserNickname();

    // 2. Завантажуємо завдання з бази даних
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => setTodos([...items]),
      error: (err) => console.error(err)
    });
    return () => sub.unsubscribe();
  }, [user]);

  const createTodo = async () => {
    const content = window.prompt("Що потрібно зробити?");
    if (content) {
      await client.models.Todo.create({ content, isDone: false });
    }
  };

  const deleteTodo = async (id) => {
    await client.models.Todo.delete({ id });
  };

  return (
    <main className="app-container">
      <header>
        <h1>Привіт, {nickname}!</h1>
        <button onClick={signOut} className="sign-out-btn">Вийти</button>
      </header>
      
      <section className="todo-section">
        <button onClick={createTodo} className="add-btn">+ Додати завдання</button>
        
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
              {todo.content}
            </li>
          ))}
        </ul>
        
        {todos.length === 0 ? (
          <p className="hint">Список порожній. Додай своє перше завдання!</p>
        ) : (
          <p className="hint">Натисни на завдання, щоб видалити його</p>
        )}
      </section>
    </main>
  );
}

// Налаштовуємо візуальну форму реєстрації
const formFields = {
  signUp: {
    nickname: {
      order: 1, // Робимо це поле найпершим у списку
      label: 'Нікнейм',
      placeholder: 'Придумай свій нік',
      isRequired: true,
    },
    email: {
      order: 2,
    },
    password: {
      order: 3,
    },
    confirm_password: {
      order: 4,
    },
  },
};

// Передаємо налаштування formFields у withAuthenticator
export default withAuthenticator(App, { formFields });