/* eslint-disable @typescript-eslint/no-misused-promises */
import { FormEvent, useState } from 'react';
import { useAuth } from '../auth/use-auth.hook';
import { useParams } from 'react-router-dom';
import { styled } from 'styled-components';

const StyledInput = styled.input`
  border: none;
  height: 32px;
  width: 100%;
  padding: 0;
`;

const MessageFormContainer = styled.div`
  background-color: gray;
  border: 1px solid gray;
  display: flex;
  gap: 1px;
  align-items: center;
`;

const StyledButton = styled.button`
  border: none;
  height: 32px;
`;

export const MessageForm = () => {
  const { roomId } = useParams();
  const auth = useAuth();
  const userId = auth.user?.id;
  const [content, setContent] = useState('');
  const token = auth.getToken();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content || !userId || !token) return;
    try {
      const body = JSON.stringify({ content, userId, roomId });

      await fetch(`http://localhost:4000/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body,
      });
      setContent('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label hidden htmlFor="message">
          Write message
        </label>
        <MessageFormContainer>
          <StyledInput
            type="text"
            id="message"
            name="message"
            value={content}
            autoComplete="off"
            onChange={(e) => setContent(e.target.value)}
          />
          <StyledButton type="submit">Send</StyledButton>
        </MessageFormContainer>
      </form>
    </div>
  );
};
