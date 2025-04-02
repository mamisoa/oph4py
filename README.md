# Oph4Py

A comprehensive ophthalmology electronic medical records (EMR) system built with Py4web framework. The system manages patient records, clinical workflows, and medical procedures in an ophthalmology practice.

## Features

- **Complete Patient Management**
  - Patient registration with eID integration
  - Medical history tracking
  - Insurance information management
  - Contact information management

- **Clinical Workflow Management**
  - Appointment scheduling
  - Procedure tracking
  - Multi-role workflow (Administrative, Medical Assistant, Doctor)
  - Real-time status updates

- **Medical Procedures**
  - Comprehensive eye examinations
  - Tonometry
  - Keratometry
  - Biometry
  - Vision tests
  - Prescription management (Glasses & Contact Lenses)

- **Documentation**
  - Medical certificates
  - Prescriptions
  - Clinical notes
  - Follow-up records
  - Billing information

- **Integration**
  - Medical device integration
  - PACS system connectivity
  - Email system for reports and prescriptions
  - Multi-facility support

## System Requirements

- Python 3.7+
- MySQL/MariaDB
- Modern web browser with JavaScript enabled
- Network connectivity for multi-user operation

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/oph4py.git
   cd oph4py
   ```

2. Install dependencies using Poetry:
   ```bash
   poetry install
   ```

3. Configure the database:
   - Copy `settings-example.py` to `settings.py`
   - Update database credentials and other configuration options

4. Initialize the database:
   ```bash
   poetry run python -m py4web.utils.initialize_db
   ```

5. Start the development server:
   ```bash
   poetry run python -m py4web run apps
   ```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- `workflow.md` - Complete system workflow
- `models.md` - Database structure and relationships
- `user.md` - User management documentation
- `worklist.md` - Workflow management documentation
- And more module-specific documentation

## Security

- Role-based access control
- Secure data storage
- Audit trails for all actions
- HIPAA-compliant data handling
- Patient privacy protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Author

Mamisoa Andriantafika

## Acknowledgments

- Py4web framework team
- Bootstrap Table contributors
- All medical professionals who provided domain expertise 