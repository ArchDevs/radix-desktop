package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type ServerService struct {
	apiUrl string
}

func NewServerService() *ServerService {
	return &ServerService{
		apiUrl: "http://localhost:8080/v1",
	}
}

type RegisterRequest struct {
	Address   string `json:"address"`
	PublicKey string `json:"public_key"`
}

type ChallengeResponse struct {
	Nonce     string `json:"nonce"`
	Timestamp int64  `json:"timestamp"`
}

type VerifyRequest struct {
	Address   string `json:"address"`
	Nonce     string `json:"nonce"`
	Signature string `json:"signature"`
}

type VerifyResponse struct {
	Token string `json:"token"`
}

func (s *ServerService) Register(address, pubKey string) error {
	request, err := json.Marshal(&RegisterRequest{Address: address, PublicKey: pubKey})
	if err != nil {
		return err
	}

	resp, err := s.doRequest(http.MethodPost, s.apiUrl+"/auth/register", request, "application/json")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("registration failed with status: %d", resp.StatusCode)
	}

	return nil
}

func (s *ServerService) CreateChallenge(address string) (*ChallengeResponse, error) {
	resp, err := s.doRequest(http.MethodGet, s.apiUrl+"/challenge?address="+address, nil, "")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("challenge creation failed with status: %d, body: %s", resp.StatusCode, string(body))
	}

	var challenge ChallengeResponse
	if err := json.NewDecoder(resp.Body).Decode(&challenge); err != nil {
		return nil, err
	}

	return &challenge, nil
}

func (s *ServerService) Verify(address, nonce, signature string) (string, error) {
	request, err := json.Marshal(&VerifyRequest{Address: address, Nonce: nonce, Signature: signature})
	if err != nil {
		return "", err
	}

	resp, err := s.doRequest(http.MethodPost, s.apiUrl+"/challenge/verify", request, "application/json")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("verify failed with status: %d, body: %s", resp.StatusCode, string(body))
	}

	var verifyResp VerifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&verifyResp); err != nil {
		return "", err
	}

	return verifyResp.Token, nil
}

func (s *ServerService) doRequest(method, url string, body []byte, contentType string) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		bodyReader = bytes.NewBuffer(body)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return nil, err
	}

	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}

	client := http.Client{Timeout: 5 * time.Second}
	return client.Do(req)
}
