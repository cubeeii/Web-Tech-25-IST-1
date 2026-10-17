import { Button } from './Button';

export interface ErrorBoxProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <div className="error-box" role="alert">
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Повторить</Button>}
    </div>
  );
}
