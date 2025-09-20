{ pkgs, ... }: {
  # Add Docker to the list of available packages
  environment.nix.pkgs = with pkgs; [
    docker
    gh
  ];

  # Enable the Docker daemon
  services.docker.enable = true;
}