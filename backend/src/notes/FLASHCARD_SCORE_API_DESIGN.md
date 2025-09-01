# Flashcard Game Score API Design

## Endpoint
- **POST /notes/flashcard-score**
  - Save a user's flashcard game score.

## Request Body
```json
{
  "score": 12,
  "bonus": 4,
  "numQuestions": 15,
  "timestamp": "2025-08-30T02:31:00Z"
}
```

## Auth
- Requires JWT authentication.
- User ID extracted from JWT.

## Controller (NotesController)
```ts
@Post('flashcard-score')
async saveFlashcardScore(
  @Body('score') score: number,
  @Body('bonus') bonus: number,
  @Body('numQuestions') numQuestions: number,
  @Body('timestamp') timestamp: string,
  @Req() req: Request
) {
  if (!req.user || !req.user['userId']) throw new BadRequestException('User not authenticated');
  const userId = req.user['userId'];
  return await this.notesService.saveFlashcardScore(userId, score, bonus, numQuestions, timestamp);
}
```

## Service (NotesService)
- Add `saveFlashcardScore(userId, score, bonus, numQuestions, timestamp)` method.
- Persist score to database (new table: flashcard_scores).

## Database
- Table: `flashcard_scores`
  - id (PK)
  - user_id (FK)
  - score (int)
  - bonus (int)
  - num_questions (int)
  - timestamp (datetime)

## Response
- Success: `{ success: true, id: ... }`
- Error: `{ success: false, error: ... }`

## Next Steps
1. Implement endpoint and service method.
2. Add table migration for `flashcard_scores`.
3. Update frontend to POST score on game over.
