// Copyright (c) 2023, osama and contributors
// For license information, please see license.txt

frappe.ui.form.on('Situation', {
	refresh(frm) {
		if (frm.doc.status == 'Accounts') {
			frm.add_custom_button(__('Sales Invoice'), function () {
				// Initialize progress
				frappe.show_progress(__('Creating Sales Invoices'), 0, frm.doc.customer.length);

				frm.doc.customer.forEach(function (customer, index) {
					frappe.db.get_single_value('Customs Clearance Settings', 'default_invoice_item')
						.then(item => {
							// Update progress after fetching item
							frappe.show_progress(__('Creating Sales Invoices'), index + 1, frm.doc.customer.length);

							frappe.call({
								method: "frappe.client.insert",
								args: {
									doc: {
										doctype: "Sales Invoice",
										customer: customer.customer,
										posting_date: frappe.datetime.get_today(),
										due_date: frappe.datetime.add_days(frappe.datetime.get_today(), 7),
										items: [
											{
												item_code: item,
												qty: 1,
												rate: 0.0,
											}
										]
									}
								},
								callback: function (response) {
									if (!response.exc) {
										// Update progress after successful creation
										frappe.show_progress(__('Creating Sales Invoices'), index + 1, frm.doc.customer.length);
										console.log(response.message);
										// You can handle the successful creation of the sales invoice here
									} else {
										// In case of error, update progress to maximum
										frappe.show_progress(__('Creating Sales Invoices'), frm.doc.customer.length, frm.doc.customer.length);
										console.log(response.exc);
										// You can handle any exceptions or errors here
									}

									// Hide progress after all operations are done
									if (index === frm.doc.customer.length - 1) {
										frappe.hide_progress();
									}
								}
							});
							frappe.db.set_value('Situation', frm.doc.name, 'status', 'Accounts')
								.then(r => {
									let doc = r.message;
									// console.log(doc);
									frappe.hide_progress();
								})
						})
				});
			}, __("Create"));
		}
	},

	before_save(frm) {
		console.log(frm.doc.select_dock_number);
		var all_docks = '';
		frm.doc.select_dock_number.forEach(element => {
			all_docks += element.record + ', ';
		});
		frm.set_value('port_dock_number', all_docks);
	}
});

// var customer_array = [];
// frappe.ui.form.on('Situation', {
// 	refresh(frm) {
// 		for (var customer in frm.doc.customer) {
// 			customer_array.push(frm.doc.customer[customer].customer);
// 		}

// 		frm.set_query("customer_name", "container_numbers", function () {
// 			return {
// 				filters: [
// 					["Customer", "customer_name", "in", customer_array],
// 				]
// 			};
// 		});
// 	}
// });


`
delete (invoice number) field [done]
distrbute expneses to invoice based on customer and containers
change doctype to submitable
show create invoice button only if status is accounts [done]
add link field to invoice
on_submit the status should be closed
add Port dock number (Link)field to situation doctype [done]
add Container Return Date (Date)field to situation doctype [done]
`