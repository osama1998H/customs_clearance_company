# Copyright (c) 2023, osama and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Situation(Document):
	def before_save(self):
		self.num_containers = len(self.container_numbers)
		self.total_qty = sum(item.qty for item in self.items)
		[item.update({'total_weight': item.qty * item.weight}) for item in self.items]
		if self.papers_date:
			grace_date = frappe.utils.add_days(self.papers_date, self.grace_days)
			self.days_late = frappe.utils.date_diff(grace_date , self.arrival_date)

		self.distribute_expenses()


		# all_docks = ''
		# for i in self.select_dock_number:
		# 	all_docks += str(i[0].record) + ', '
		# self.port_dock_number = all_docks
		# frappe.msgprint(all_docks)


	def distribute_expenses(self):
		expenses_portion = self.total_expenses / self.num_containers
		for container in self.container_numbers:
			container.expenses = expenses_portion

	def on_submit(self):
		self.status = 'Closed'