{
  description = "pytest-multi-results-action development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_20;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            nodePackages.npm
            nodePackages.prettier
            python313Packages.pip
            python313Packages.pytest
            python313Packages.pytest-metadata
          ];

          shellHook = ''
            echo "🧪 pytest-multi-results-action Development Environment"
            echo "=================================================="
            echo ""
            echo "Available commands:"
            npm run

          '';
        };
      }
    );
}
