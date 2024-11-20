const users_table_body = document.getElementById('users-table-body');
const user_form = document.getElementById('user-details-form');
const user_id = document.getElementById('hidden-user-id');
const user_name = document.getElementById('user-name');
const user_email = document.getElementById('user-email');
const user_phone = document.getElementById('user-phone');

const api_endpoint = 'http://localhost:3000/api/users';

const display_data = async () => {
    try {
        const response = await axios.get(api_endpoint);
        const user_list = response.data;
        populate_table(user_list);
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
};

const populate_table = (user_list) => {
    users_table_body.innerHTML = user_list.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="edit_data(${user.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="delete_data(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');
};

user_form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const user_data = {
        name: user_name.value,
        email: user_email.value,
        phone: user_phone.value,
    };

    try {
        if (user_id.value) {
            await edit_data(user_id.value, user_data);
        } else {
            await create_data(user_data);
        }
        reset_form();
        display_data();
    } catch (error) {
        console.error('Failed to save data:', error);
    }
});

const edit_data = async (user_id_value, user_data) => {
    try {
        await axios.put(`${api_endpoint}/${user_id_value}`, user_data);
    } catch (error) {
        console.error('Failed to edit data:', error);
    }
};

const create_data = async (user_data) => {
    try {
        await axios.post(api_endpoint, user_data);
    } catch (error) {
        console.error('Failed to create data:', error);
    }
};

const delete_data = async (user_id_value) => {
    try {
        await axios.delete(`${api_endpoint}/${user_id_value}`);
        display_data();
    } catch (error) {
        console.error('Failed to delete data:', error);
    }
};

const populate_form = async (user_id_value) => {
    try {
        const response = await axios.get(`${api_endpoint}/${user_id_value}`);
        const user = response.data;

        user_id.value = user.id;
        user_name.value = user.name;
        user_email.value = user.email;
        user_phone.value = user.phone;
    } catch (error) {
        console.error('Failed to populate form:', error);
    }
};

const reset_form = () => {
    user_form.reset();
    user_id.value = '';
};

display_data();
