function selectCountry() {
    const svgObject = document.getElementById('svgMap');
    const countrySelect = document.querySelector('select');

    svgObject.addEventListener('load', () => {
        const svgDoc = svgObject.contentDocument;
        const svgPaths = svgDoc.querySelectorAll('path');
        console.log(svgPaths);

        let numberOfCountry = 0;

        svgPaths.forEach((path) => {
            // Try to get id, name, or fallback to class
            const countryId = path.getAttribute('id') || path.getAttribute('class');
            const countryName = path.getAttribute('name') || path.getAttribute('class');

            // Skip if no meaningful identifiers found
            if (!countryId || !countryName) {
                return;
            }

            console.log('Country ID:', countryId + ', Name:', countryName);
            numberOfCountry++;
            console.log('Total number of countries:', numberOfCountry);

            // Create and append the <option> for the country
            const option = document.createElement('option');
            option.value = countryId;
            option.textContent = countryName;
            countrySelect.appendChild(option);

            // Add click listener to path
            path.addEventListener('click', () => {
                path.style.fill = 'red';
                console.log(`Clicked on ${countryName} (ID: ${countryId})`);
                countrySelect.value = countryId;
            });
        });
    });
}

selectCountry();
