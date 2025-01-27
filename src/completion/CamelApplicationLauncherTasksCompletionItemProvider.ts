/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as jsonparser from 'jsonc-parser';
import * as vscode from 'vscode';
export class CamelApplicationLauncherTasksCompletionItemProvider implements vscode.CompletionItemProvider {
	
	private mavenCompletion: vscode.CompletionItem = {
		label: 'Start Camel application with Maven with camel.debug profile',
		documentation: 'Start Camel application with camel.debug profile. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask.',
		insertText:
			`{
	"label": "Start Camel application with camel.debug profile",
	"type": "shell",
	"command": "mvn", // mvn binary of Maven must be available on command-line
	"args": [
		"camel:run",
		"-Pcamel.debug" // This depends on your project. The goal here is to have camel-debug on the classpath.
	],
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops. 
}`
	};
	
	private mavenQuarkusCompletion: vscode.CompletionItem = {
		label: 'Start Camel application with Maven Quarkus Dev with camel.debug profile',
		documentation: 'Start Camel application with Maven Quarkus dev and camel.debug profile. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask.',
		insertText:
			`{
	"label": "Start Camel application with Maven Quarkus Dev with camel.debug profile",
	"type": "shell",
	"command": "mvn", // mvn binary of Maven must be available on command-line
	"args": [
		"compile",
		"quarkus:dev",
		"-Pcamel.debug" // This depends on your project. The goal here is to have camel-debug on the classpath.
	],
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true // Must be set as background as the Maven commands doesn't return until the Camel application stops. 
}`
	};
	
	private jbangCompletion: vscode.CompletionItem = {
		label: 'Start Camel application with JBang with camel-debug',
		documentation: 'Start debuggable Camel application with JBang. It provides extra-configuration required to combine with a Camel Debugger launch configuration as a preLaunchTask.',
		insertText:
			`{
	"label": "Start Camel application with JBang with camel-debug",
	"type": "shell",
	"command": "jbang", // jbang binary must be available on command-line
	"args": [
		"-Dcamel.jbang.version=3.16.0", // to adapt to your Camel version. 3.16+ is required
		"camel@apache/camel",
		"run",
		"\${relativeFile}", //to adapt to your workspace, using relativeFile means that the task must be launched when the file to start in debug in the active editor
		"--logging-level=info",
		"--reload",
		"--dep=org.apache.camel:camel-debug"
	],
	"problemMatcher": "$camel.debug.problemMatcher",
	"presentation": {
		"reveal": "always"
	},
	"isBackground": true // Must be set as background as the jbang command doesn't return until the Camel application stops. 
}`
	};
	
	
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		const globalNode = jsonparser.parseTree(document.getText());
		let completions: vscode.CompletionItem[] = [];
		if(globalNode !== undefined) {
			const node = jsonparser.findNodeAtOffset(globalNode, document.offsetAt(position), false);
			if (node) {
				if (this.isInTasksArray(node)) {
					
					completions.push(this.mavenCompletion);
					completions.push(this.mavenQuarkusCompletion);
					completions.push(this.jbangCompletion);
				}
			}
		}
		return completions;
	}
		
	private isInTasksArray(node: jsonparser.Node) {
		return this.isInArray(node)
			&& this.isParentTasks(node);
	}

	private isInArray(node: jsonparser.Node) {
		return node?.type === "array";
	}

	private isParentTasks(node: jsonparser.Node) {
		return this.isParentHasStringPropertyOfType(node, 'tasks');
	}
	
	private isParentHasStringPropertyOfType(node: jsonparser.Node, type: string) {
		const parent = node.parent;
		if (parent !== undefined && parent.type === "property") {
			const nodeTasks = parent.children?.find(child => {
				return child.type === "string" && child.value === type;
			});
			return nodeTasks !== undefined;
		}
		return false;
	}	
}
