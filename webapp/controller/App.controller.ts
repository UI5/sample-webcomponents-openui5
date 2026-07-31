import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import Theming from "sap/ui/core/Theming";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import applyDirection from "@ui5/webcomponents-base/dist/locale/applyDirection.js";

/**
 * Main controller — feature parity with the React/Angular todo samples,
 * implemented in the OpenUI5/SAPUI5 programming model over UI5 Web Components.
 *
 * The Web Components are consumed through their generated SAPUI5 control wrappers,
 * so they behave like normal UI5 controls: events expose data via
 * `event.getParameter(...)`, values via getters (`getValue()`), and popover/dialog
 * open state via `setOpen(true)` — NOT the raw DOM `.value` / `.detail` / `.open`.
 *
 * @namespace sample.webcomponents.openui5.controller
 */
export default class App extends Controller {
	private getModel(): JSONModel {
		return this.getView()!.getModel() as JSONModel;
	}

	private control<T extends Control = Control>(id: string): T {
		return this.byId(id) as unknown as T;
	}

	// The todo id for the row that owns the control that fired the event.
	private ownerTodoId(event: Event): number {
		const source = event.getSource() as Control;
		const ctx = source.getBindingContext();
		return Number(ctx!.getProperty("id"));
	}

	// --- Add a new todo (Add button click or Input submit) ---
	public onAdd(): void {
		const input = this.control(("todoInput")) as unknown as { getValue(): string; setValue(v: string): void };
		const datePicker = this.control(("todoDeadline")) as unknown as { getValue(): string; setValue(v: string): void };

		const model = this.getModel();
		const todos = model.getProperty("/todos") as Array<Record<string, unknown>>;
		const maxId = todos.reduce((max, t) => Math.max(max, Number(t.id)), 0);

		todos.push({
			text: input.getValue() || "",
			id: maxId + 1,
			deadline: datePicker.getValue() || "",
			done: false,
		});
		model.setProperty("/todos", todos);
		input.setValue("");
		datePicker.setValue("");
	}

	// --- Delete a todo ---
	public onRemove(event: Event): void {
		const id = this.ownerTodoId(event);
		const model = this.getModel();
		const todos = (model.getProperty("/todos") as Array<Record<string, unknown>>).filter(
			(todo) => Number(todo.id) !== id
		);
		model.setProperty("/todos", todos);
	}

	// --- Open the edit dialog ---
	public onEdit(event: Event): void {
		const id = this.ownerTodoId(event);
		const model = this.getModel();
		const todo = (model.getProperty("/todos") as Array<Record<string, unknown>>).find(
			(t) => Number(t.id) === id
		);
		if (!todo) {
			return;
		}
		model.setProperty("/todoBeingEdited", { id: todo.id, text: todo.text, deadline: todo.deadline });
		(this.control("editDialog") as unknown as { setOpen(v: boolean): void }).setOpen(true);
	}

	public onCancelEdit(): void {
		(this.control("editDialog") as unknown as { setOpen(v: boolean): void }).setOpen(false);
	}

	public onSaveEdit(): void {
		const model = this.getModel();
		const edited = model.getProperty("/todoBeingEdited") as Record<string, unknown>;
		const todos = (model.getProperty("/todos") as Array<Record<string, unknown>>).map((todo) => {
			if (Number(todo.id) === Number(edited.id)) {
				todo.text = edited.text;
				todo.deadline = edited.deadline;
			}
			return todo;
		});
		model.setProperty("/todos", todos);
		(this.control("editDialog") as unknown as { setOpen(v: boolean): void }).setOpen(false);
	}

	// --- Mark selected items done (Incompleted list) ---
	public onDone(event: Event): void {
		const ids = this.selectedTodoIds(event);
		const model = this.getModel();
		const todos = (model.getProperty("/todos") as Array<Record<string, unknown>>).map((todo) => ({
			...todo,
			done: todo.done || ids.includes(Number(todo.id)),
		}));
		model.setProperty("/todos", todos);
	}

	// --- Mark items not-done (Completed list) ---
	public onUnDone(event: Event): void {
		const ids = this.selectedTodoIds(event);
		const model = this.getModel();
		const todos = (model.getProperty("/todos") as Array<Record<string, unknown>>).map((todo) => ({
			...todo,
			done: ids.includes(Number(todo.id)),
		}));
		model.setProperty("/todos", todos);
	}

	// Ids of the currently selected list items, via their binding contexts.
	private selectedTodoIds(event: Event): number[] {
		const selectedItems = ((event as unknown as { getParameter(n: string): Control[] }).getParameter("selectedItems")) || [];
		return selectedItems
			.map((item) => item.getBindingContext())
			.filter(Boolean)
			.map((ctx) => Number(ctx!.getProperty("id")));
	}

	// --- ShellBar: theme palette item toggles the theme popover ---
	public onThemeSettingsToggle(event: Event): void {
		const popover = this.control("themePopover") as unknown as {
			setOpener(o: Control): void;
			setOpen(v: boolean): void;
		};
		popover.setOpener(event.getSource() as Control);
		popover.setOpen(true);
	}

	public onThemeChange(event: Event): void {
		const selected = (((event as unknown as { getParameter(n: string): Control[] }).getParameter("selectedItems")) || [])[0];
		if (!selected) {
			return;
		}
		const theme = (selected as unknown as { data(key: string): string }).data("theme");
		if (theme) {
			Theming.setTheme(theme);
		}
	}

	// --- ShellBar: profile click opens the profile popover ---
	public onProfileClick(): void {
		const popover = this.control("profilePopover") as unknown as {
			setOpener(o: Control): void;
			setOpen(v: boolean): void;
		};
		popover.setOpener(this.control("profileAvatar"));
		popover.setOpen(true);
	}

	public onProfileSettingsSelect(event: Event): void {
		const item = (event as unknown as { getParameter(n: string): Control }).getParameter("item");
		const key = (item as unknown as { data(key: string): string }).data("key");
		if (key === "settings") {
			(this.control("settingsDialog") as unknown as { setOpen(v: boolean): void }).setOpen(true);
		} else if (key === "help") {
			(this.control("helpDialog") as unknown as { setOpen(v: boolean): void }).setOpen(true);
		}
	}

	public onSettingsDialogClose(): void {
		(this.control("settingsDialog") as unknown as { setOpen(v: boolean): void }).setOpen(false);
	}

	public onHelpDialogClose(): void {
		(this.control("helpDialog") as unknown as { setOpen(v: boolean): void }).setOpen(false);
	}

	// --- Settings: RTL switch ---
	public onRtlSwitchChange(event: Event): void {
		const checked = (event.getSource() as unknown as { getChecked(): boolean }).getChecked();
		document.body.dir = checked ? "rtl" : "ltr";
		applyDirection();
	}

	// --- Settings: content density switch ---
	public onContentDensitySwitchChange(event: Event): void {
		const checked = (event.getSource() as unknown as { getChecked(): boolean }).getChecked();
		if (checked) {
			document.body.classList.add("ui5-content-density-compact");
		} else {
			document.body.classList.remove("ui5-content-density-compact");
		}
	}
}
