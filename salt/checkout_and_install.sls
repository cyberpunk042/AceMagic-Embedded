{% set repo_url = 'https://github.com/cyberpunk042/AceMagic-Embedded.git' %}
{% set repo_dir = '/opt/AceMagic-Embedded' %}

# Set environment variables for devices (these will be available to the scripts)
{% set macro_device = salt['environ.get']('MACRO_USB_DEVICE', 'DefaultMacroDevice') %}
{% set microphone_device = salt['environ.get']('MICROPHONE_USB_DEVICE', 'DefaultMicrophoneDevice') %}
{% set speaker_device = salt['environ.get']('SPEAKER_USB_DEVICE', 'DefaultSpeakerDevice') %}

# Ensure git is installed
install_git:
  pkg.installed:
    - name: git

# Clone the repository if it doesn't exist
clone_repository:
  git.latest:
    - name: {{ repo_url }}
    - target: {{ repo_dir }}
    - force_fetch: True
    - require:
      - pkg: install_git
# Ensure environment variables are set and available to the install scripts
set_device_env_variables:
  cmd.run:
    - name: |
        export MACRO_USB_DEVICE="{{ macro_device }}"
        export MICROPHONE_USB_DEVICE="{{ microphone_device }}"
        export SPEAKER_USB_DEVICE="{{ speaker_device }}"
    - shell: /bin/bash

# Run the install_prerequisite script (this script will handle the logic internally)
run_install_prerequisite:
  cmd.run:
    - name: ./install_prerequisite
    - cwd: {{ repo_dir }}
    - user: root
    - require:
      - git: clone_repository
      - cmd: set_device_env_variables

# Run the install script (this script will handle the logic internally)
run_install:
  cmd.run:
    - name: ./install
    - cwd: {{ repo_dir }}
    - user: root
    - require:
      - cmd: run_install_prerequisite
