import { Binding, Component } from "@loopback/core";
import { AuthorizeService } from ".";
import { AuthorizeServiceBindings } from "./keys";

export class MyAuthorizationComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(AuthorizeServiceBindings.AUTRHORIZE_SERVICE).toClass(AuthorizeService)
  ];
}