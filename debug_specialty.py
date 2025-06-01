# Debug script to test specialty options
specialties = ["ophthalmology", "general", "consultation"]
specialtyOptions = "\n".join(
    [
        f'<option value="{specialty}"{" selected" if specialty == "ophthalmology" else ""}>{specialty.title()}</option>'
        for specialty in specialties
    ]
)

print("Generated specialtyOptions:")
print(repr(specialtyOptions))
print("\nFormatted output:")
print(specialtyOptions)
