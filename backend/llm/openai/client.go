package openai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
	"github.com/openai/openai-go/v3/shared"
)

func ChatCompletions(prompt string) {
	client := openai.NewClient(
		option.WithBaseURL("https://api.deepseek.com"),
		option.WithAPIKey(os.Getenv("OPEN_AI_KEY")),
	)
	params := openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage("你是一个ai，会说中文"),
			openai.UserMessage(prompt),
		},
		Model:           "deepseek-v4-flash",
		ReasoningEffort: "max",
	}
	params.SetExtraFields(map[string]any{
		"thinking": map[string]string{"type": "enabled"},
	})
	chatCompletion, err := client.Chat.Completions.New(context.Background(), params)
	if err != nil {
		panic(err)
	}
	fmt.Println(chatCompletion.RawJSON())
	field := chatCompletion.Choices[0].Message.JSON.ExtraFields["reasoning_content"].Raw()
	fmt.Println("思考内容：", field)
}

func Response(prompt string) {
	client := openai.NewClient(
		option.WithBaseURL("https://api.deepseek.com"),
		option.WithAPIKey(os.Getenv("OPEN_AI_KEY")),
	)
	res, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: "deepseek-v4-flash",
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String(prompt),
		},
		Reasoning: shared.ReasoningParam{
			Effort: "max",
		},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(res.RawJSON())
	bytes, err := json.Marshal(res)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(bytes))
}
