/* Questions offered under the chat input, depending on the page the user is on. */
export function suggestionsFor(section: string | undefined): string[] {
    switch (section) {
        case "backlog":
        return ["Which todos should I do first?", "Which todos are missing story points?"]
        case "board":
        return ["What's blocking this sprint?", "Are we on track to finish the sprint?"]
        case "sprints":
        return ["How did the last sprint go?", "What should we improve in the next sprint?"]
        default:
        return []
    }
}