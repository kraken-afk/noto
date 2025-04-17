import os
import uuid
from huey.contrib.djhuey import task  # type: ignore
import markdown
from weasyprint import HTML  # type: ignore
from django.conf import settings


@task()
def generate_pdf_from_markdown(
    markdown_content: str, user_id: str, note_id: str
):
    html_content = markdown.markdown(markdown_content)

    timestamp = uuid.uuid4()
    filename = f'note_{note_id}_{timestamp}.pdf'

    pdf_dir = os.path.join(
        settings.MEDIA_ROOT, 'pdfs', str(user_id), str(note_id)
    )
    os.makedirs(pdf_dir, exist_ok=True)

    pdf_path = os.path.join(pdf_dir, filename)

    styled_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ 
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 2cm;
            }}
            h1, h2, h3, h4, h5, h6 {{ color: #333; }}
            code {{ background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }}
            pre {{ background: #f4f4f4; padding: 1em; overflow-x: auto; }}
            blockquote {{ border-left: 4px solid #ddd; padding-left: 1em; color: #666; }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """

    HTML(string=styled_html).write_pdf(pdf_path)

    return os.path.join('pdfs', str(user_id), str(note_id), filename)
