import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace sample.webcomponents.openui5
 */
export default class Component extends UIComponent {
	public static metadata = {
		manifest: "json",
		interfaces: ["sap.ui.core.IAsyncContentCreation"],
	};

	public init(): void {
		super.init();

		// The todo data model — same initial todos as the React/Angular samples.
		const todoModel = new JSONModel({
			todos: [
				{ text: "Get some carrots", id: 1, deadline: "27/7/2018", done: false },
				{ text: "Do some magic", id: 2, deadline: "22/7/2018", done: false },
				{ text: "Go to the gym", id: 3, deadline: "24/7/2018", done: false },
				{ text: "Buy milk", id: 4, deadline: "30/7/2018", done: false },
				{ text: "Eat some fruits", id: 5, deadline: "29/7/2018", done: true },
			],
			todoBeingEdited: { id: -1, text: "", deadline: "" },
		});
		this.setModel(todoModel);
	}
}
