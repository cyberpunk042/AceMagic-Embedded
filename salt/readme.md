# SaltStack Checkout and Install for USB Devices

This guide explains how to use the provided SaltStack `.sls` file to clone a repository, set environment variables for USB devices, and run installation scripts (`install_prerequisite` and `install`) that handle USB device detection internally.

## Prerequisites

Before getting started, make sure you have the following:

1. SaltStack master and minion installed on your systems.
2. Root or sudo access to the target device.
3. The SaltStack state file (`checkout_and_install.sls`) is placed in your Salt master state directory (typically `/srv/salt`).

### Setting Environment Variables

You can set environment variables for the USB devices (`MACRO_USB_DEVICE`, `MICROPHONE_USB_DEVICE`, and `SPEAKER_USB_DEVICE`) in your `.bashrc` or the Salt environment.

To set these variables:

1. **Edit `.bashrc`:**

   ```bash
   sudo nano ~/.bashrc
   ```

   Add the following lines:

   ```bash
   export MACRO_USB_DEVICE="Logitech, Inc. Unifying Receiver"
   export MICROPHONE_USB_DEVICE="Corsair Gaming Mouse"
   export SPEAKER_USB_DEVICE="SpeakerDeviceName"
   ```

   Save the file and source it:

   ```bash
   source ~/.bashrc
   ```

These environment variables will be passed to the installation scripts, allowing them to handle USB device detection.

### How to Use the `.sls` File

1. **Place the State File on the Master:**

   Copy the provided `.sls` file (`checkout_and_install.sls`) into the Salt master's state directory, typically `/srv/salt/`:

   ```bash
   sudo cp checkout_and_install.sls /srv/salt/
   ```

2. **Define the Minion Target:**

   Modify your Salt master’s top file (`/srv/salt/top.sls`) to target your minion and apply the state:

   ```yaml
   base:
     'minion-id':
       - checkout_and_install
   ```

   Replace `minion-id` with the actual ID of your minion.

3. **Apply the State:**

   Run the following command on the Salt master to apply the state to the minion:

   ```bash
   sudo salt 'minion-id' state.apply
   ```

This will clone the repository, set the environment variables for the devices, and run the `install_prerequisite` and `install` scripts.

### Device Detection Logic in the Scripts

Your `install_prerequisite` and `install` scripts should contain the logic to check for connected USB devices (using `lsusb`) and proceed accordingly. SaltStack ensures that the environment is set up and the scripts are run, but it leaves the USB detection to your own script logic.

## Conclusion

You have now successfully set up your device as a Salt minion and applied the `checkout_and_install.sls` state, which clones a repository, sets environment variables, and runs installation scripts that handle USB device detection.
