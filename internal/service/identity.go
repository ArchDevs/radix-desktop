package service

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"radix-desktop/internal/crypto"

	"github.com/mr-tron/base58"
	"github.com/tyler-smith/go-bip39"
)

type IdentityService struct {
	serverSvc *ServerService
}

type Identity struct {
	Mnemonic string `json:"mnemonic"`
	Address  string `json:"address"`
}

func NewIdentityService(serverSvc *ServerService) *IdentityService {
	return &IdentityService{
		serverSvc: serverSvc,
	}
}

func (s *IdentityService) Create() (*Identity, error) {
	seed := make([]byte, 32)
	if _, err := rand.Read(seed); err != nil {
		return nil, fmt.Errorf("failed to generate seed: %w", err)
	}

	mnemonic, err := bip39.NewMnemonic(seed)
	if err != nil {
		return nil, err
	}

	privKey := ed25519.NewKeyFromSeed(seed)
	pubKey := privKey.Public().(ed25519.PublicKey)
	address := s.GetAddressFromPubKey(pubKey)

	if err := crypto.SaveToKeyring("private_key", privKey); err != nil {
		return nil, err
	}
	if err := crypto.SaveToKeyring("public_key", pubKey); err != nil {
		return nil, err
	}

	s.serverSvc.Register(address, base64.StdEncoding.EncodeToString(pubKey))

	return &Identity{
		Mnemonic: mnemonic,
		Address:  address,
	}, nil
}

func (s *IdentityService) Load() (privKey ed25519.PrivateKey, pubKey ed25519.PublicKey, err error) {
	privKeyBytes, err := crypto.GetFromKeyring("private_key")
	if err != nil {
		return nil, nil, err
	}
	privKey = ed25519.PrivateKey(privKeyBytes)

	pubKeyBytes, err := crypto.GetFromKeyring("public_key")
	if err != nil {
		return nil, nil, err
	}
	pubKey = ed25519.PublicKey(pubKeyBytes)

	return privKey, pubKey, nil
}

func (s *IdentityService) GetAddressFromPubKey(pubKey ed25519.PublicKey) string {
	return "rad:" + base58.Encode(pubKey)[:16]
}

func (s *IdentityService) Authenticate() (string, error) {
	privKey, pubKey, err := s.Load()
	if err != nil {
		return "", fmt.Errorf("load keys failed: %w", err)
	}

	address := s.GetAddressFromPubKey(pubKey)

	challenge, err := s.serverSvc.CreateChallenge(address)
	if err != nil {
		return "", fmt.Errorf("challenge creation failed: %w", err)
	}

	signature := ed25519.Sign(privKey, []byte(challenge.Nonce))
	signatureB64 := base64.StdEncoding.EncodeToString(signature)

	token, err := s.serverSvc.Verify(address, challenge.Nonce, signatureB64)
	if err != nil {
		return "", fmt.Errorf("verify failed: %w", err)
	}

	return token, nil
}

func (s *IdentityService) Clear() error {
	keys := []string{"private_key", "public_key"}
	for _, key := range keys {
		_ = crypto.DeleteFromKeyring(key)
	}
	return nil
}
