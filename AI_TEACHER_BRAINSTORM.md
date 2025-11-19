# AI Teacher Continuous Speaking & Blackboard Reading - Brainstorm & Plan

## Goals

1. **Continuous Speaking:**  
   The AI Teacher should behave like a real tutor, speaking continuously and proactively, not just waiting for student prompts. After finishing a response, the AI should continue teaching unless interrupted.

2. **Blackboard Reading:**  
   The AI should read and explain content from the digital blackboard, not just from the conversation. The speech synthesis should prioritize reading new/unread blackboard content.

---

## Implementation Plan

### 1. Continuous Speaking Logic

- After the AI finishes speaking a response, it should automatically trigger a "continue teaching" action.
- This action will:
  - Check for new/unread blackboard content.
  - If available, read the next blackboard entry aloud.
  - If not, optionally continue with a lesson plan or summary.
- The AI should pause this loop if the student interrupts (e.g., asks a question or uses the voice input).

### 2. Blackboard Reading

- Maintain a pointer/index to track which blackboardContent entries have been read aloud.
- When "continue teaching" is triggered, fetch the next unread blackboard entry and use speakText to read it.
- Mark the entry as read after speaking.
- If all entries are read, the AI can summarize, ask a question, or wait for student input.

### 3. User Interruption

- If the student sends a message or uses voice input, the AI should:
  - Pause the continuous teaching loop.
  - Respond to the student's input.
  - After handling, optionally resume teaching.

### 4. UI/UX Considerations

- Optionally, show a "Teaching..." indicator when the AI is in continuous mode.
- Allow the student to pause/resume the AI's teaching.

---

## Next Steps

- [x] Brainstorm and document requirements and plan (this file)
- [ ] Update AITeacher.tsx to implement continuous teaching loop
- [ ] Add logic to read from blackboardContent, not just conversation
- [ ] Track which blackboard entries have been read aloud
- [ ] Handle user interruption to pause/resume teaching
- [ ] Test and refine the experience
