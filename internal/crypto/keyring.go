package crypto

import (
	"encoding/base64"

	"github.com/zalando/go-keyring"
)

func SaveToKeyring(key string, value []byte) error {
	encoded := base64.StdEncoding.EncodeToString(value)
	return keyring.Set("radix", key, encoded)
}

func GetFromKeyring(key string) ([]byte, error) {
	encoded, err := keyring.Get("radix", key)
	if err != nil {
		return nil, err
	}
	return base64.StdEncoding.DecodeString(encoded)
}

func DeleteFromKeyring(key string) error {
	return keyring.Delete("radix", key)
}
