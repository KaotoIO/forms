import { Button } from '@patternfly/react-core';
import { LightbulbIcon } from '@patternfly/react-icons';
import { FunctionComponent } from 'react';

interface SuggestionsButtonProps {
  propName: string;
  onClick: () => void;
}

export const SuggestionsButton: FunctionComponent<SuggestionsButtonProps> = ({ propName, onClick }) => (
  <Button
    variant="plain"
    className="kaoto-form__suggestions-button"
    data-testid={`${propName}__open-suggestions-button`}
    onClick={onClick}
    aria-label="Open suggestions"
    title="Open suggestions (Ctrl+Space)"
    icon={<LightbulbIcon />}
  />
);
