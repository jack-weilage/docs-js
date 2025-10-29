import { Container } from "@cloudflare/containers";

export class BuilderContainer extends Container {
	defaultPort = 8080;
	sleepAfter = "1m";
}
