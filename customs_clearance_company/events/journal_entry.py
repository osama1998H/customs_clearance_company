
import frappe

def update_situation_with_expenses(doc, method):
	for account in doc.accounts:
	# Check if the account has a valid 'situation' attribute
		if account.situation and account.situation is not None:
			# Fetch the 'Situation' document based on the account's 'situation' attribute
			situation_doc = frappe.get_doc('Situation', account.situation)
			
			# Append expenses data to the 'expenses_data' field of the 'Situation' document
			situation_doc.append("expenses_data", {
				'amount': doc.total_debit,
				'je_link': doc.name,
				'user_remark': doc.user_remark,
			})
			
			# Save the 'Situation' document after appending expenses data
			situation_doc.save()
			
			# Calculate the total expenses by iterating over the 'expenses_data' records
			total_expenses = 0
			for record in situation_doc.expenses_data:
				total_expenses += record.amount
			
			# Update the 'total_expenses' field of the 'Situation' document with the calculated value
			situation_doc.total_expenses = total_expenses
			situation_doc.distribute_expenses()
			
			# Save the 'Situation' document after updating the 'total_expenses' field
			situation_doc.save()
			
			# Exit the loop after processing the first valid account
			break

