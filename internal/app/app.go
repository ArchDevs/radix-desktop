package app

import (
	"context"

	"radix-desktop/internal/service"
)

type App struct {
	ctx         context.Context
	identitySvc *service.IdentityService
}

func NewApp() *App {
	serverSvc := service.NewServerService()
	return &App{
		identitySvc: service.NewIdentityService(serverSvc),
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Authenticate() (string, error) {
	return a.identitySvc.Authenticate()
}
