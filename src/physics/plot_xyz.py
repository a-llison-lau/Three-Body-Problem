#!/usr/bin/env python3
"""
Simple plotting of XYZ files using matplotlib animations.
"""
import sys
import collections
import argparse
import numpy as np
import matplotlib
import matplotlib.animation
import matplotlib.pyplot as plt
import mpl_toolkits.mplot3d


def load_xyz(filename):
        """
        Load an xyz-format file into a dictionary of arrays.

        Because XYZ file particle names are not always unique, this
        also adds a suffix to the name of each particle, "|0" "|1", "|2", ...

        Parameters
        ----------
        filename: str
            The input file path

        Returns
        -------
        dict
            Dictionary mapping particle name to trajectory
        """
        with open(filename, "r") as f:
            # The built-in python "collections" module contains various handy tools.
            # In this case we are using a special form of a dictionary which returns
            # an empty object (list, in this case) when the key is not found.
            # We use it here because we don't know the names of particles in advance,
            # and this just creates them as we go along.
            data = collections.defaultdict(list)
            while True:
                line = f.readline()[:4]
                # if we have reached the end of the file, finish
                if line == "":
                    break
                # otherwise line is the particle count
                n = int(float(line))
                # ignore the comment line
                _ = f.readline()
                for i in range(n):
                    split_line = f.readline().split()[:4]  
                    name = split_line[0]
                    x, y , z = split_line[1:4]
                    name = name + f"|{i}"
                    data[name].append((float(x), float(y), float(z)))

        # Convert the lists to arrays. This is called a dictionary comprehension.
        data = {name: np.array(d) for name, d in data.items()}
        return data

def animate_xyz_2d(data, skip=10, size=8, mode="xy", show_labels=True, interval=50, output=""):
    """
    Make a matplotlib animation of the supplied data.

    Parameters
    ----------
    data: dict
        Maps particle names to (nstep, 3) xyz numpy arrays
    skip: int
        Number of time steps to skip per frame. Default = 10
    show_labels: bool
        Show text name by each particle.  Default = True

    Returns
    -------
    None
    """
    # Make the array
    fig, ax = plt.subplots()

    if mode == "xy":
        x = 0
        y = 1
    elif mode == "yz":
        x = 1
        y = 2
    elif mode == "xz":
        x = 0
        y = 2
    else:
        raise ValueError(f"Unknown plotting mode {mode}")

    # Convert our dictionary to one big 3D array (bodies, time, xyz)
    trajectories = np.array(list(data.values()))
    nbody = len(data)

    # Make a scatter plot of the (x, y) positions (0, 1) at the first time
    # step.  Size 8 is reasonably visible, and we use a different colour for
    # each particle just by setting the c argument to the array [0, 1, 2, 3, ..]
    S = ax.scatter(
        trajectories[:, 0, x],
        trajectories[:, 0, y],
        c=np.arange(trajectories.shape[0]),
        s=size,
    )

    # Initialize lines for paths
    lines = [ax.plot([], [], lw=2)[0] for _ in range(nbody)]

    # Make the labels by each object.  We will animate them too.
    # Remove the "|0", "|1" etc.
    if show_labels:
        labels = []
        for name, t in data.items():
            labels.append(ax.annotate(name.split("|")[0], [t[0, x], t[0, y]]))

    xmin = np.min(trajectories[:, :, x])
    xmax = np.max(trajectories[:, :, x])
    ymin = np.min(trajectories[:, :, y])
    ymax = np.max(trajectories[:, :, y])

    plt.xlim(xmin, xmax)
    plt.ylim(ymin, ymax)
    # Make sure the x and y axes are scaled the same
    ax.set_aspect('equal', adjustable='box')

    # We will animate this title also.
    title = plt.title("Time Step 0")

    # This function is called once per frame
    # to move the elements.
    def update(frame):
        step = skip * frame
        # Move the points
        S.set_offsets(trajectories[:, step, [x, y]])
        # Update the paths
        for i, line in enumerate(lines):
            line.set_data(trajectories[i, :step+1, x], trajectories[i, :step+1, y])
        # Move the labels
        # Change the title
        title.set_text(f"Time Step {step}")
        if show_labels:
            for i in range(nbody):
                labels[i].set_x(trajectories[i, step, x])
                labels[i].set_y(trajectories[i, step, y])
            return labels + lines + [S, title]
        else:
            return lines + [S, title]

    # Print out for info.
    nstep = trajectories.shape[1]
    nframe = nstep // skip
    print(f"Displaying {nframe} frames for {nstep} time steps")

    # Interval is the number of milliseconds between frames
    anim = matplotlib.animation.FuncAnimation(
        fig, update, nframe, interval=interval, blit=False
    )

    # This displays the animation
    if output:
        anim.save(output)
    else:
        plt.show()

    return anim

def plot_xyz_trajectory(data, skip=10, mode="xy", show_labels=True, output=""):
    """
    Make a matplotlib plot of the trejctory of the supplied data.

    Parameters
    ----------
    data: dict
        Maps particle names to (nstep, 3) xyz numpy arrays
    skip: int
        Number of time steps to skip per frame. Default = 10
    show_labels: bool
        Show text name by each particle.  Default = True

    Returns
    -------
    None
    """
    # Make the array
    _, ax = plt.subplots()

    if mode == "xy":
        x = 0
        y = 1
    elif mode == "yz":
        x = 1
        y = 2
    elif mode == "xz":
        x = 0
        y = 2
    else:
        raise ValueError(f"Unknown plotting mode {mode}")


    # Convert our dictionary to one big 3D array (bodies, time, xyz)
    trajectories = np.array(list(data.values()))

    # Make a scatter plot of the (x, y) positions (0, 1) at the first time
    # step.  Size 8 is reasonably visible, and we use a different colour for
    # each particle just by setting the c argument to the array [0, 1, 2, 3, ..]
    for body_data in trajectories:
        ax.plot(
            body_data[::skip, x],
            body_data[::skip, y]
        )

    # Make the labels by each object.  We will animate them too.
    # Remove the "|0", "|1" etc.
    if show_labels:
        for name, t in data.items():
            ax.annotate(name.split("|")[0], [t[0, x], t[0, y]])

    # Make sure the x and y axes are scaled the same
    ax.axis("equal")

    # This displays the animation
    if output:
        plt.savefig(output)
    else:
        plt.show()



def animate_xyz_3d(data, skip=10, size=8, interval=50, output=""):
    """
    Make a matplotlib animation of the supplied data.

    Parameters
    ----------
    data: dict
        Maps particle names to (nstep, 3) xyz numpy arrays
    skip: int
        Number of time steps to skip per frame. Default = 10
    show_labels: bool
        Show text name by each particle.  Default = True

    Returns
    -------
    None
    """
    # use these to help make the code more readable
    x, y, z = 0, 1, 2
    # Make the array
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    # Convert our dictionary to one big 3D array (bodies, time, xyz)
    trajectories = np.array(list(data.values()))

    # Make a scatter plot of the (x, y) positions (0, 1) at the first time
    # step.  Size 8 is reasonably visible, and we use a different colour for
    # each particle just by setting the c argument to the array [0, 1, 2, 3, ..]
    S = ax.scatter(
        trajectories[:, 0, x],
        trajectories[:, 0, y],
        trajectories[:, 0, z],
        c=np.arange(trajectories.shape[0]),
        s=size,
    )



    # We will animate this title also.
    title = plt.title("Time Step 0")

    # This function is called once per frame
    # to move the elements.
    def update(frame):
        step = skip * frame
        # Move the points
        px = trajectories[:, step, x]
        py = trajectories[:, step, y]
        pz = trajectories[:, step, z]
        S._offsets3d = (px, py, pz)
        # Move the labels
        # Change the title
        title.set_text(f"Time Step {step}")
        return [S, title]

    # Print out for info.
    nstep = trajectories.shape[1]
    nframe = nstep // skip
    print(f"Displaying {nframe} frames for {nstep} time steps")

    # Interval is the number of milliseconds between frames
    # I don't quite understand what blit does but without it
    # the old particles are not removed
    anim = matplotlib.animation.FuncAnimation(
        fig, update, nframe, interval=interval, blit=False
    )

    if output:
        anim.save(output)
    else:
        plt.show()


def recenter_xyz(data, center):
    """
    Adjust the coordinates of the bodies to put a specified one at the center,
    for example to see the moon rotating around the Earth more easily.

    A new data dict is returned.

    Parameters
    ----------
    data: dict
        Maps particle names to (nstep, 3) xyz numpy arrays
    center: str
        Name of the body to center on

    Returns
    -------
    data: dict
        Same format as input
    """
    if center not in data:
        for name in data.keys():
            # Check for the name but with the tag added.
            if name.split("|")[0] == center:
                center = name
                break
        # This else condition is triggered if the break condition is not
        else:
            raise ValueError(f"Body specified as new center not found: {center}")

    # Get the trajectory of the center
    center_trajectory = data[center]

    # Make new output data
    output = {
        name: trajectory - center_trajectory for (name, trajectory) in data.items()
    }

    return output


# This is the easiest way to make a good python command-line interface.
# argparse is a module that comes with python that lets you write a tool that
# checks what the user types on the command line and complains if they type
# something that doesn't work.
# We first define the options.
parser = argparse.ArgumentParser(description="Animate an XYZ file")

parser.add_argument(
    "filename", help="The name of the xyz file (including the .xyz extension)"
)

parser.add_argument(
    "--interval", "-i", type=int, default=50, help="Milliseconds between frames"
)

parser.add_argument(
    "--steps", "-s", type=int, default=1, help="Number of steps per frame of the animation"
)

parser.add_argument(
    "--size", "-S", type=int, default=8, help="The size of each particle"
)

parser.add_argument(
    "--yz", action="store_true", help="Plot y vs z instead of x vs y"
)

parser.add_argument(
    "--xz", action="store_true", help="Plot x vs z instead of x vs y"
)

parser.add_argument(
    "--3d", action="store_true", help="Plot in 3D (labels not supported)"
)

parser.add_argument(
    "--center",
    "-c",
    type=str,
    default=None,
    help="Recenter the XYZ file on the named particle",
)

parser.add_argument(
    "--no-labels",
    action="store_true",
    help="Omit labels, for example if there are too many of them",
)

parser.add_argument(
    "--trajectory",
    "-t",
    action="store_true",
    dest="trajectory",
    help="Only plot the trajectories for the full simulation"
)

parser.add_argument(
    "--output",
    "-o",
    type=str,
    default="",
    help="Save the result to this file."
)

def main():
    # In the main function we use the parser object we made above
    # to read what the user wrote on the command line.  Then we can
    # use the dot syntax to get the chosen values
    args = parser.parse_args()
    data = load_xyz(args.filename)

    # recenter, if desired
    if args.center:
        data = recenter_xyz(data, args.center)

    if args.yz:
        mode = "yz"
    elif args.xz:
        mode = "xz"
    else:
        mode = "xy"
    # make the plot
    if args.trajectory:
        plot_xyz_trajectory(data, skip=args.steps, mode=mode,
                            show_labels=not args.no_labels, output=args.output)
    else:
        if vars(args)['3d']:
            animate_xyz_3d(data, skip=args.steps,
                           size=args.size, interval=args.interval, output=args.output)
        else:
            animate_xyz_2d(data, skip=args.steps, mode=mode,
                           size=args.size, show_labels=not args.no_labels, interval=args.interval, output=args.output)



if __name__ == "__main__":
    main()
