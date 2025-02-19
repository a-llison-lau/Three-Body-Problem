# Compiler
CXX = g++
CXXFLAGS = -Wall -Wextra -O2 -std=c++17

# Source and headers
SRCS = main.cpp
OBJS = $(SRCS:.cpp=.o)
DEPS = particle3D.hpp forces_and_separations.hpp integrator.hpp

# Executable name
TARGET = simulation

# Default rule
all: $(TARGET)

# Linking the final executable
$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^

# Compiling object files
%.o: %.cpp $(DEPS)
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Clean rule
clean:
	rm -f $(OBJS) $(TARGET)

# Phony targets
.PHONY: all clean
