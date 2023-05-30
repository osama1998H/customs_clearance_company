from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in customs_clearance_company/__init__.py
from customs_clearance_company import __version__ as version

setup(
	name="customs_clearance_company",
	version=version,
	description="Customs Clearance Company",
	author="osama",
	author_email="osama@aoai.io",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
