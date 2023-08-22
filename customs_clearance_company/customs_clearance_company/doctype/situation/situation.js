// Copyright (c) 2023, osama and contributors
// For license information, please see license.txt

frappe.ui.form.on('Situation', {
	refresh(frm) {
		if (frm.doc.status == 'Accounts') {
			frm.add_custom_button(__('Create Invoice'), function () {
				frappe.call({
					method: "customs_clearance_company.customs_clearance_company.doctype.situation.situation.create_sales_invoices",
					args: {
						docname: frm.doc.name
					},
					callback: function (response) {
						// Handle the server script response if needed
						frm.refresh();
					}
				});
			}, __("Create"));
		}
	},


	before_save(frm) {
		splitDocksRecords(frm);
	},
	// make form uneditable if status is closed
	before_load: function (frm) {
		if (frm.doc.status === 'Closed') {
			frm.set_read_only();
		}
	}
});


function splitDocksRecords(frm) {
	if (frm.doc.select_dock_number) {
		if (frm.doc.select_dock_number.length != 0) {
			const dockNumbers = frm.doc.select_dock_number.map(element => element.record).join(', ');
			frm.set_value('port_dock_number', dockNumbers);
		}
	}
}