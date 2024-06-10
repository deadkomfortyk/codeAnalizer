#include <stdio.h>
#include <string.h>

/* C example with vulnerabilities */

// Vulnerability 1: Using gets() is dangerous
void getInput() {
    char input[100];
    gets(input); // This is dangerous
    printf("You entered: %s\n", input);
}

// Vulnerability 2: Using strcpy() can cause buffer overflow
void copyString(char *source) {
    char destination[10];
    strcpy(destination, source); // This can cause buffer overflow
    printf("Copied string: %s\n", destination);
}

// Vulnerability 3: Using system() is dangerous as it can execute arbitrary commands
void executeCommand(char *command) {
    system(command); // This is dangerous
}

// Vulnerability 4: Using strcat() can cause buffer overflow
void concatenateString(char *source) {
    char destination[10] = "Hello";
    strcat(destination, source); // This can cause buffer overflow
    printf("Concatenated string: %s\n", destination);
}

// Vulnerability 5: Using sprintf() can cause buffer overflow
void formatString(char *source) {
    char buffer[10];
    sprintf(buffer, "Hello %s", source); // This can cause buffer overflow
    printf("Formatted string: %s\n", buffer);
}

// Example usage
int main() {
    getInput();
    copyString("This string is too long for the destination buffer");
    executeCommand("ls -la");
    concatenateString("World");
    formatString("World");
    return 0;
}
