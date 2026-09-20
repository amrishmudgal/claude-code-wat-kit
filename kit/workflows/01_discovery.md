# 01 Discovery → PRD

**Goal:** a one-page `brain/01_PRD.md` the owner agrees with. No technology talk.
**Rule:** one question at a time, precise language, offer an example answer. The owner knows systems and delivery, so ask about flows, data, integrations and roles directly. Never ask about languages, frameworks or libraries. Stop when you can write the PRD. Usually 6 to 10 questions.

Ask about, in this order
1. The problem, and who has it. Ask for one real person as an example.
2. What that person does today instead.
3. The single outcome that would make them say "this is useful".
4. The smallest set of things a user must be able to do for that outcome. Push back on anything that is not needed for it.
5. What is explicitly not in version one. Propose the list yourself from what they mentioned and ask them to confirm. Typical: payments, mobile app, admin panel, AI extras, social features.
6. For every capability that moves data or runs on its own, the six build questions. Ask only the ones the owner has not already answered:
   - **Source:** where does the data come from? Do they already have an account there?
   - **Output:** where should results show up: in the app, email, Slack, a spreadsheet?
   - **Trigger:** does it run on a schedule (how often), react to an event, or when someone presses a button?
   - **Accounts:** which services do they already have, and which would be new sign-ups?
   - **Success:** what exactly should they see when it works?
   - **Edge cases:** what should happen when there is nothing new, or the outside service is down?
7. Constraints: monthly budget for services, deadline, phone or desktop first, languages, any accounts they already own, any data that is sensitive.
8. How they will know it works: turn their answer into numbered success criteria.

Then
- Use the `researcher` subagent for a 15-minute look at 2 or 3 existing alternatives: what they do well, what they charge, the gap this product fills. Add three lines to the PRD. Do not let research expand the scope.
- Write `brain/01_PRD.md`. Read it back as a short functional spec: actors, flows, data entities, integrations, out of scope. Edit until the owner says yes.
- Draft the phase rows in `brain/04_PLAN.md` from the MVP scope: one vertical slice per row.
- Close the session with the `/handoff` steps.

**Exit check:** Open questions section is empty. Out-of-scope list has at least three items. Owner said yes.
