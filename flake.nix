{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    bundix = {
      url = "github:inscapist/bundix/main";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    ruby-nix = {
      url = "github:inscapist/ruby-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    bundix,
    ruby-nix
  }: let
    system = "x86_64-linux";

    pkgs = import nixpkgs {
      inherit system;
      overlays = [ ruby-nix.overlays.ruby ];
    };
    rubyNix = ruby-nix.lib pkgs;
		bundixcli = bundix.packages.${system}.default;

    # LaTeX environment for TikZ → SVG compilation.
    # pdflatex (scheme-basic) compiles .tex → .pdf;
    # dvisvgm (--pdf mode) converts the PDF → SVG.
    texlivePkgs = pkgs.texlive.combine {
      inherit (pkgs.texlive)
        scheme-basic   # core: latex, pdflatex, plain TeX, essential packages
        standalone     # standalone document class — crops output to content
        pgf            # TikZ / PGF + libraries (arrows, shapes, positioning…)
        amsmath        # AMS math environments (\align, \gather, etc.) + latexsym
        amscls         # AMS document classes (amsthm, amsart, etc.)
        dvisvgm        # DVI/PDF → SVG converter (provides the dvisvgm binary)
        ;
    };

    deps = with pkgs; [ env ruby bundixcli texlivePkgs ];

    inherit (rubyNix {
      name = "seroperson.gitlab.io";
      gemset = ./gemset.nix;
      gemConfig = pkgs.defaultGemConfig;
    })
      env ruby;
  in {
    packages.${system} = let
      bundlecli = pkgs.writeShellApplication {
        name = "bundle";
        runtimeInputs = deps;
        text = ''
          export BUNDLE_PATH=vendor/bundle
          bundle "$@"
        '';
      };
      jekyll = pkgs.writeShellApplication {
        name = "jekyll";
        runtimeInputs = deps;
        text = ''
          if [ $# -eq 0 ]; then
            jekyll build
          else
            jekyll "$@"
          fi
        '';
      };
    in {
      jekyll = jekyll;
      bundle = bundlecli;
      bundix = bundixcli;
      default = jekyll;
    };

    devShells.${system}.default = pkgs.mkShell {
      shellHook = ''
        export BUNDLE_PATH=vendor/bundle
      '';
      buildInputs = deps;
    };
  };
}
