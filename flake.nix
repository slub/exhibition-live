{
  description = "Flake for dev shell each default system";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_latest
            nodePackages_latest.yarn
            nodePackages_latest.pnpm
            nodePackages_latest.prisma
            prisma-engines
            #jetbrains.idea-ultimate
            apache-jena
            librdf_raptor2
            bun
            openssl
            appimage-run
            tree
          ];
          LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib";
          PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
          PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
          PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
          CYPRESS_RUN_BINARY = "${pkgs.cypress}/bin/Cypress";
        };
      }
    );
}
