# Generated by Django 2.2 on 2020-09-30 23:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('eegPortalApp', '0008_epoch'),
    ]

    operations = [
        migrations.AddField(
            model_name='epoch',
            name='description',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
    ]
