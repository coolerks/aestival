package anthropic

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
)

func Messages(prompt string) {
	client := anthropic.NewClient(
		option.WithAPIKey(os.Getenv("OPEN_AI_KEY")),
		option.WithBaseURL("https://api.deepseek.com/anthropic"),
	)
	res, err := client.Messages.New(context.Background(), anthropic.MessageNewParams{
		MaxTokens: 2048,
		Messages: []anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock(prompt)),
		},
		Model: "deepseek-v4-flash",
		OutputConfig: anthropic.OutputConfigParam{
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
