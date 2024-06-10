# Python example with vulnerabilities

# Vulnerability 1: Using exec() is dangerous
def execute_code(code):
    exec(code)  # This is dangerous

# Vulnerability 2: Using eval() is dangerous
def evaluate_expression(expression):
    result = eval(expression)  # This is dangerous
    print(f"Result: {result}")

# Vulnerability 3: Using subprocess.Popen with shell=True is dangerous
import subprocess

def run_command(command):
    process = subprocess.Popen(command, shell=True)  # This is dangerous
    process.communicate()

# Vulnerability 4: Using pickle.load on untrusted data is dangerous
import pickle

def load_data(data):
    return pickle.loads(data)  # This is dangerous

# Vulnerability 5: Using yaml.load on untrusted data is dangerous
import yaml

def load_yaml(data):
    return yaml.load(data, Loader=yaml.Loader)  # This is dangerous

# Example usage
execute_code("print('Executing code')")
evaluate_expression("2 + 2")
run_command("ls -la")
load_data(b"cos\\nsystem\\n(S'ls -la'\\ntR.")  # This will execute 'ls -la'
load_yaml("!!python/object/apply:os.system ['ls -la']")
