# Flashcard Game Points System Design

## Points Awarding Rules
- +1 point for each correct answer.
- 0 points for incorrect answers.
- +2 bonus points for every 5 consecutive correct answers (streak bonus).
- Optionally, add a timer for speed bonus (future enhancement).

## Storage
- Points are tracked in React state for the current session.
- On session end or at intervals, points are sent to the backend to persist in the user's profile.

## Display
- Show current points at the top of the flashcard game UI.
- Show feedback after each answer: "Correct! +1 point" or "Incorrect. 0 points".
- Show streaks and bonus notifications.
- At the end of the session, display total points and any new high score.

## Backend
- Add/update an endpoint to save and retrieve user flashcard game scores.
- Store scores per user, with optional history for analytics.

## UI/UX
- Add a "Play Game" button to start the game mode.
- When in game mode, show points, feedback, and a "Game Over" or "Session Complete" summary.

## Next Steps
1. Update FlashcardGenerator to add "Play Game" mode.
2. Implement points logic in state.
3. Add UI for points and feedback.
4. Implement game logic: present one card at a time, check answers, track streaks.
5. Add backend integration for persisting scores.
