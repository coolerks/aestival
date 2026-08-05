package openai

import "testing"

func TestMessages(t *testing.T) {
	ChatCompletions("你是谁")
}

func TestResponse(t *testing.T) {
	Response("你是谁")
}
