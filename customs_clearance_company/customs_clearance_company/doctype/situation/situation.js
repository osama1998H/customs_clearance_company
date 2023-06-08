// Copyright (c) 2023, osama and contributors
// For license information, please see license.txt

frappe.ui.form.on('Situation', {
	refresh(frm) {
		if (frm.doc.status == 'Accounts') {
			frm.add_custom_button(__('Sales Invoice'), function () {

				// Group expenses by customer
				const groupedExpenses = {};
				frm.doc.container_numbers.forEach(function (container) {
					if (!groupedExpenses[container.customer_name]) {
						groupedExpenses[container.customer_name] = 0;
					}
					groupedExpenses[container.customer_name] += container.expenses;
				});

				// Create sales invoices for each customer
				const customerEntries = Object.entries(groupedExpenses);
				const totalCustomers = customerEntries.length;

				customerEntries.forEach(([customer, expenses], index) => {
					frappe.db.get_single_value('Customs Clearance Settings', 'default_invoice_item')
						.then(item => {
							// Update progress after fetching item
							frappe.show_progress(__('Creating Sales Invoices'), index + 1, totalCustomers);

							frappe.call({
								method: "frappe.client.insert",
								args: {
									doc: {
										doctype: "Sales Invoice",
										customer: customer,
										posting_date: frappe.datetime.get_today(),
										due_date: frappe.datetime.add_days(frappe.datetime.get_today(), 7),
										situation: frm.doc.name,
										items: [
											{
												item_code: item,
												qty: 1,
												rate: expenses,
											}
										]
									}
								},
								callback: function (response) {
									if (!response.exc) {
										// Update progress after successful creation
										frappe.show_progress(__('Creating Sales Invoices'), index + 1, totalCustomers);
										console.log(response.message.name);
										// You can handle the successful creation of the sales invoice here
									} else {
										// In case of error, update progress to maximum
										frappe.show_progress(__('Creating Sales Invoices'), totalCustomers, totalCustomers);
										console.log(response.exc);
										// You can handle any exceptions or errors here
									}

									// Hide progress after all operations are done
									if (index === totalCustomers - 1) {
										frappe.hide_progress();
									}
									frappe.hide_progress();
								}
							});
						});
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



`
delete (invoice number) field [done]
distrbute expneses to invoice based on customer and containers [done]
change doctype to submitable [done]
show create invoice button only if status is accounts [done]
add link field to invoice [done]
on_submit the status should be closed [done]
add Port dock number (Link)field to situation doctype [done]
add Container Return Date (Date)field to situation doctype [done]
`

function splitDocksRecords(frm) {
	if (frm.doc.select_dock_number) {
		if (frm.doc.select_dock_number.length != 0) {
			const dockNumbers = frm.doc.select_dock_number.map(element => element.record).join(', ');
			frm.set_value('port_dock_number', dockNumbers);
		}
	}
}