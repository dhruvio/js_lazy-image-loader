{ pkgs ? import <nixpkgs> {} }:

with pkgs;

mkShell rec {
  buildInputs = [ nodejs-10_x ];
  shellHook = ''
    source ~/.bashrc
    npm install
  '';
}
