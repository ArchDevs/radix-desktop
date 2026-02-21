package app

import (
	"radix-desktop/internal/service"
)

func (a *App) CreateIdentity() (*service.Identity, error) {
	return a.identitySvc.Create()
}

func (a *App) HasIdentity() bool {
	_, _, err := a.identitySvc.Load()
	return err == nil
}

func (a *App) GetAddress() (string, error) {
	_, pubKey, err := a.identitySvc.Load()
	if err != nil {
		return "", err
	}
	return a.identitySvc.GetAddressFromPubKey(pubKey), nil
}

func (a *App) ClearIdentity() error {
	return a.identitySvc.Clear()
}
