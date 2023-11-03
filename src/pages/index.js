// Import necessary modules
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function MapForm() {
  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // Get form data
    const googleMapKey = event.target.googleMapKey.value;
    const googleMapId = event.target.googleMapId.value;
    const originLocation = event.target.originLocation.value;
    const destinationLocation = event.target.destinationLocation.value;

    // Save form data to cookies
    Cookies.set("googleMapKey", googleMapKey);
    Cookies.set("googleMapId", googleMapId);
    Cookies.set("originLocation", originLocation);
    Cookies.set("destinationLocation", destinationLocation);

    // Redirect to the /walk route
    window.location.href = "/walk";
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* The form itself with added spacing */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded shadow-lg"
      >
        <div>
          <label
            htmlFor="googleMapKey"
            className="block text-sm font-medium text-gray-700"
          >
            Google Map Key
          </label>
          <input
            type="text"
            name="googleMapKey"
            id="googleMapKey"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="googleMapId"
            className="block text-sm font-medium text-gray-700"
          >
            Google Map ID
          </label>
          <input
            type="text"
            name="googleMapId"
            id="googleMapId"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="originLocation"
            className="block text-sm font-medium text-gray-700"
          >
            Origin Location
          </label>
          <input
            type="text"
            name="originLocation"
            id="originLocation"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="destinationLocation"
            className="block text-sm font-medium text-gray-700"
          >
            Destination Location
          </label>
          <input
            type="text"
            name="destinationLocation"
            id="destinationLocation"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
