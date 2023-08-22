# Copyright (c) 2023, osama and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Situation(Document):
    def before_save(self):
        self.num_containers = len(self.container_numbers)
        self.total_qty = sum(item.qty for item in self.items)
        [item.update({'total_weight': item.qty * item.weight})
         for item in self.items]
        if self.papers_date:
            grace_date = frappe.utils.add_days(
                self.papers_date, self.grace_days)
            self.days_late = frappe.utils.date_diff(
                grace_date, self.arrival_date)

        if self.expenses_data:
            self.distribute_expenses()

        if self.departure_date:
            self.container_return_date = frappe.utils.add_days(
                self.departure_date, 7)

    def distribute_expenses(self):
        expenses_portion = self.total_expenses / self.num_containers
        for container in self.container_numbers:
            container.expenses = expenses_portion


@frappe.whitelist()
def create_sales_invoices(docname):
    doc = frappe.get_doc("Situation", docname)

    if doc.status == "Accounts":
        # Group expenses by customer
        grouped_expenses = {}
        for container in doc.container_numbers:
            if container.customer_name not in grouped_expenses:
                grouped_expenses[container.customer_name] = 0
            grouped_expenses[container.customer_name] += container.expenses

        item = frappe.db.get_single_value("Customs Clearance Settings", "default_invoice_item")

        sales_invoice = frappe.get_doc({
            "doctype": "Sales Invoice",
            "customer": doc.customer,
            "posting_date": frappe.utils.nowdate(),
            "due_date": frappe.utils.add_days(frappe.utils.nowdate(), 7),
            "situation": doc.name,
            "number_of_containers": doc.num_containers,
            "policy_number": doc.policy_number,
            "items": [
                {
                    "item_code": item,
                    "qty": 1,
                    "rate": doc.total_expenses
                }
            ]
        })

        try:
            sales_invoice.insert(ignore_permissions=True)
            # Handle the successful creation of the sales invoice here
        except Exception as e:
            frappe.log_error(title="Error creating Sales Invoice", message=str(e))
            # Handle any exceptions or errors here

        frappe.publish_progress(
            title="Creating Sales Invoices",
            description="Sales invoices created successfully",
            percent=100
        )

